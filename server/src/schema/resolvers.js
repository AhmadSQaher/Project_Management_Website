const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const { signToken, COOKIE_NAME } = require('../utils/auth');
const { hashPassword, comparePassword } = require('../utils/hash');
const { GraphQLScalarType, Kind } = require('graphql');

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const resolvers = {
  Date: dateScalar,
  // Map legacy DB status strings to GraphQL enum tokens
  Project: {
    status: (project) => {
      const s = project.status;
      if (!s) return null;
      const norm = String(s).toLowerCase();
      if (norm === 'completed' || norm === 'completed') return 'COMPLETED';
      if (norm === 'in progress' || norm === 'in_progress' || norm === 'in-progress') return 'IN_PROGRESS';
      if (norm === 'pending' || norm === 'pending') return 'PENDING';
      // If it's already one of the tokens, return as-is
      if (['COMPLETED','IN_PROGRESS','PENDING'].includes(String(s))) return String(s);
      return 'PENDING';
    }
  },
  
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      return User.findById(user.id).select('-password');
    },
    users: async (_, __, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      return User.find().select('-password');
    },
    user: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return User.findById(id).select('-password');
    },
    teams: async () => Team.find().populate('members'),
    team: async (_, { id }) => Team.findById(id).populate('members'),
    projects: async (_, __, { user }) => {
      // Admins see all projects. Members only see projects assigned to their teams.
      if (!user) return [];
      if (user.role === 'Admin') return Project.find().populate({ path: 'team', populate: { path: 'members' } });
      // Find teams that include this user
      const userTeams = await Team.find({ members: user.id }).select('_id');
      const teamIds = userTeams.map(t => t._id);
      if (teamIds.length === 0) return [];
      return Project.find({ team: { $in: teamIds } }).populate({ path: 'team', populate: { path: 'members' } });
    },
    project: async (_, { id }, { user }) => {
      const p = await Project.findById(id).populate({ path: 'team', populate: { path: 'members' } });
      if (!p) return null;
      if (!user) throw new Error('Unauthorized');
      if (user.role === 'Admin') return p;
      const memberIds = (p.team && p.team.members) ? p.team.members.map(m => String(m._id || m)) : [];
      if (!p.team || !memberIds.includes(String(user.id))) throw new Error('Unauthorized');
      return p;
    },
  },

  Mutation: {
    register: async (_, { input }, { user }) => {
      // Allow open registration for Members by default.
      // Admin creation is restricted unless ALLOW_ADMIN_REGISTRATION=true.
      const usersCount = await User.countDocuments();
      const allowOpenAdmin = process.env.ALLOW_ADMIN_REGISTRATION === 'true';

      if (input.role === 'Admin') {
        // If open admin registration not enabled, only Admins (or initial seed) can create Admins
        if (!allowOpenAdmin) {
          if (usersCount > 0 && (!user || user.role !== 'Admin')) {
            throw new Error('Only admin can create admin users');
          }
        }
      } else {
        // For Member registrations allow self-registering even when users exist.
        // (No check needed)
      }

      const hashed = await hashPassword(input.password);
      const newUser = await User.create({ ...input, password: hashed });
      return { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role };
    },
    login: async (_, { email, password }, { res }) => {
      const found = await User.findOne({ email });
      if (!found) throw new Error('Invalid credentials');
      const ok = await comparePassword(password, found.password);
      if (!ok) throw new Error('Invalid credentials');
      const token = signToken({ id: found._id, role: found.role });
      // Set secure cookie options; secure only in production
      res.cookie(COOKIE_NAME, token, { 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      return { token, user: { id: found._id, username: found.username, email: found.email, role: found.role } };
    },
    logout: async (_, __, { res }) => {
      res.clearCookie(COOKIE_NAME);
      return true;
    },

    createTeam: async (_, { input }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      const team = await Team.create({ name: input.name, description: input.description, members: input.memberIds || [], slogan: input.slogan });
      return team.populate('members');
    },

    updateTeam: async (_, { id, name, description, memberIds, status, slogan }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      const team = await Team.findById(id);
      if (!team) throw new Error('Not found');
      if (name) team.name = name;
      if (description) team.description = description;
      if (typeof status !== 'undefined') team.status = status;
      if (typeof slogan !== 'undefined') team.slogan = slogan;
      if (memberIds) team.members = memberIds;
      await team.save();
      return team.populate('members');
    },

    deleteTeam: async (_, { id }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      await Team.findByIdAndDelete(id);
      await Project.updateMany({ team: id }, { $unset: { team: '' } });
      return true;
    },

    createProject: async (_, { input }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      const project = await Project.create({ name: input.name, description: input.description, team: input.teamId || null, startDate: input.startDate, endDate: input.endDate });
      return project.populate({ path: 'team', populate: { path: 'members' } });
    },

    updateProject: async (_, { id, name, description, teamId, startDate, endDate, status }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const project = await Project.findById(id).populate('team');
      if (!project) throw new Error('Not found');
      if (user.role !== 'Admin') {
        // members can be ObjectId or populated objects; normalize to id strings
        const memberIds = (project.team && project.team.members) ? project.team.members.map(m => String(m._id || m)) : [];
        if (!project.team || !memberIds.includes(String(user.id))) throw new Error('Unauthorized');
      }
      if (name) project.name = name;
      if (description) project.description = description;
      if (typeof status !== 'undefined') project.status = status;
      if (typeof teamId !== 'undefined') project.team = teamId;
      if (typeof startDate !== 'undefined') project.startDate = startDate;
      if (typeof endDate !== 'undefined') project.endDate = endDate;
      await project.save();
      return project.populate({ path: 'team', populate: { path: 'members' } });
    },

    deleteProject: async (_, { id }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      await Project.findByIdAndDelete(id);
      return true;
    },

    updateProjectStatus: async (_, { id, status }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const project = await Project.findById(id).populate('team');
      if (!project) throw new Error('Not found');
      if (user.role !== 'Admin') {
        // members can be ObjectId or populated objects; normalize to id strings
        const memberIds = (project.team && project.team.members) ? project.team.members.map(m => String(m._id || m)) : [];
        if (!project.team || !memberIds.includes(String(user.id))) throw new Error('Unauthorized');
      }
      project.status = status;
      await project.save();
      return project.populate({ path: 'team', populate: { path: 'members' } });
    },

    addMemberToTeam: async (_, { teamId, userId }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      const team = await Team.findById(teamId);
      if (!team) throw new Error('Not found');
      if (!team.members.map(String).includes(String(userId))) team.members.push(userId);
      await team.save();
      return team.populate('members');
    },

    removeMemberFromTeam: async (_, { teamId, userId }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      const team = await Team.findById(teamId);
      if (!team) throw new Error('Not found');
      team.members = team.members.filter(m => String(m) !== String(userId));
      await team.save();
      return team.populate('members');
    }
    ,
    updateUser: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      // Admins can update any user; users can update their own profile
      if (user.role !== 'Admin' && String(user.id) !== String(id)) throw new Error('Unauthorized');
      const u = await User.findById(id);
      if (!u) throw new Error('Not found');
      if (input.username) u.username = input.username;
      if (input.email) u.email = input.email;
      if (typeof input.password !== 'undefined' && input.password) {
        u.password = await hashPassword(input.password);
      }
      if (typeof input.role !== 'undefined') {
        // only admin may change roles
        if (user.role !== 'Admin') throw new Error('Unauthorized to change role');
        u.role = input.role;
      }
      await u.save();
      return { id: u._id, username: u.username, email: u.email, role: u.role };
    },

    deleteUser: async (_, { id }, { user }) => {
      if (!user || user.role !== 'Admin') throw new Error('Unauthorized');
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) throw new Error('Not found');
      // remove user from any teams
      await Team.updateMany({}, { $pull: { members: id } });
      return true;
    }
  }
};

module.exports = resolvers;
