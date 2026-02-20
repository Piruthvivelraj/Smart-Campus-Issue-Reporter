import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Issues.css';

const IssueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState('');
  const [updateData, setUpdateData] = useState({ status: '', priority: '' });

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const res = await axios.get(`/api/issues/${id}`);
      setIssue(res.data);
      setUpdateData({ status: res.data.status, priority: res.data.priority });
    } catch (error) {
      console.error('Error fetching issue:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/issues/${id}/comments`, { text: comment });
      setComment('');
      fetchIssue();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/issues/${id}`, updateData);
      fetchIssue();
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await axios.delete(`/api/issues/${id}`);
        navigate('/issues');
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  if (!issue) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="issue-detail">
        <div className="issue-header-detail">
          <h1>{issue.title}</h1>
          <div className="issue-badges">
            <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>
              {issue.status}
            </span>
            <span className={`badge badge-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
          </div>
        </div>

        <div className="issue-info">
          <div className="info-item">
            <strong>Category:</strong> {issue.category}
          </div>
          <div className="info-item">
            <strong>Location:</strong> {issue.location}
          </div>
          <div className="info-item">
            <strong>Reported By:</strong> {issue.reportedBy.name}
          </div>
          <div className="info-item">
            <strong>Created:</strong> {new Date(issue.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="issue-description-full">
          <h3>Description</h3>
          <p>{issue.description}</p>
        </div>

        {user?.role === 'admin' && (
          <div className="admin-controls">
            <h3>Admin Controls</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={updateData.priority}
                  onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="admin-actions">
              <button onClick={handleUpdate} className="btn btn-primary">Update Issue</button>
              <button onClick={handleDelete} className="btn btn-danger">Delete Issue</button>
            </div>
          </div>
        )}

        <div className="comments-section">
          <h3>Comments ({issue.comments.length})</h3>
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              required
            />
            <button type="submit" className="btn btn-primary">Add Comment</button>
          </form>
          <div className="comments-list">
            {issue.comments.map((c, idx) => (
              <div key={idx} className="comment">
                <div className="comment-header">
                  <strong>{c.user.name}</strong>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
