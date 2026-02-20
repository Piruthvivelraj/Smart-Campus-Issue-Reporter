import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/issues');
      const issues = res.data;
      setRecentIssues(issues.slice(0, 5));
      setStats({
        total: issues.length,
        open: issues.filter(i => i.status === 'Open').length,
        inProgress: issues.filter(i => i.status === 'In Progress').length,
        resolved: issues.filter(i => i.status === 'Resolved').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <Link to="/issues/new" className="btn btn-primary">Report New Issue</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Issues</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔓</div>
          <div className="stat-info">
            <h3>{stats.open}</h3>
            <p>Open</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <div className="recent-issues">
        <h2>Recent Issues</h2>
        {recentIssues.length === 0 ? (
          <p className="no-issues">No issues reported yet.</p>
        ) : (
          <div className="issues-list">
            {recentIssues.map(issue => (
              <Link to={`/issues/${issue._id}`} key={issue._id} className="issue-card">
                <div className="issue-header">
                  <h3>{issue.title}</h3>
                  <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>
                    {issue.status}
                  </span>
                </div>
                <p className="issue-description">{issue.description.substring(0, 100)}...</p>
                <div className="issue-meta">
                  <span className={`badge badge-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                  <span className="issue-category">{issue.category}</span>
                  <span className="issue-location">📍 {issue.location}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
