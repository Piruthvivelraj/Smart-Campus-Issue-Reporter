import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Issues.css';

const IssueList = () => {
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      
      const res = await axios.get(`/api/issues?${params}`);
      setIssues(res.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  return (
    <div className="container">
      <div className="issues-header">
        <h1>All Issues</h1>
        <Link to="/issues/new" className="btn btn-primary">Report New Issue</Link>
      </div>

      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Cleanliness">Cleanliness</option>
          <option value="Safety">Safety</option>
          <option value="Technology">Technology</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {issues.length === 0 ? (
        <p className="no-issues">No issues found.</p>
      ) : (
        <div className="issues-list">
          {issues.map(issue => (
            <Link to={`/issues/${issue._id}`} key={issue._id} className="issue-card">
              <div className="issue-header">
                <h3>{issue.title}</h3>
                <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>
                  {issue.status}
                </span>
              </div>
              <p className="issue-description">{issue.description.substring(0, 150)}...</p>
              <div className="issue-meta">
                <span className={`badge badge-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                <span className="issue-category">{issue.category}</span>
                <span className="issue-location">📍 {issue.location}</span>
                <span className="issue-date">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueList;
