import { Request, Response } from 'express';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'created_at'],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      users: rows,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      totalUsers: count
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role });
    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user.id,
        firstName: user.get('first_name'),
        lastName: user.get('last_name'),
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};