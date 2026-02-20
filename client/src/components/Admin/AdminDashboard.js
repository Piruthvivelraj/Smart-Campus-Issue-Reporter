import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/analytics');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (!analytics) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="container">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Issue Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Issues</span>
              <span className="summary-value">{analytics.summary.totalIssues}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Open</span>
              <span className="summary-value open">{analytics.summary.openIssues}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">In Progress</span>
              <span className="summary-value progress">{analytics.summary.inProgressIssues}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Resolved</span>
              <span className="summary-value resolved">{analytics.summary.resolvedIssues}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Closed</span>
              <span className="summary-value closed">{analytics.summary.closedIssues}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Issues by Category</h3>
          <div className="chart-data">
            {analytics.issuesByCategory.map(item => (
              <div key={item._id} className="chart-item">
                <span className="chart-label">{item._id}</span>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{ width: `${(item.count / analytics.summary.totalIssues) * 100}%` }}
                  />
                </div>
                <span className="chart-value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Issues by Priority</h3>
          <div className="chart-data">
            {analytics.issuesByPriority.map(item => (
              <div key={item._id} className="chart-item">
                <span className="chart-label">{item._id}</span>
                <div className="chart-bar">
                  <div
                    className="chart-fill priority"
                    style={{ width: `${(item.count / analytics.summary.totalIssues) * 100}%` }}
                  />
                </div>
                <span className="chart-value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>User Statistics</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Users</span>
              <span className="summary-value">{analytics.users.totalUsers}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Students</span>
              <span className="summary-value">{analytics.users.totalStudents}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Admins</span>
              <span className="summary-value">{analytics.users.totalAdmins}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-issues-admin">
        <h2>Recent Issues</h2>
        <div className="issues-table">
          {analytics.recentIssues.map(issue => (
            <div key={issue._id} className="table-row">
              <div className="table-cell">
                <strong>{issue.title}</strong>
                <p>{issue.description.substring(0, 80)}...</p>
              </div>
              <div className="table-cell">
                <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>
                  {issue.status}
                </span>
              </div>
              <div className="table-cell">
                <span className={`badge badge-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
              </div>
              <div className="table-cell">{issue.category}</div>
              <div className="table-cell">{issue.reportedBy.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
