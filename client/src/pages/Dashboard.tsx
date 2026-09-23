import type { DashboardData } from "../types";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const response = await Promise.allSettled([
          api.get<DashboardData>("/dashboard"),
        ]);
        if (response[0].status === "fulfilled") {
          setDashboardData(response[0].value.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (!user) return null;

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <p className="dashboard-kicker">Operations Snapshot</p>
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Track workload, project volume, and recent task activity in one place.
        </p>
      </header>

      <section className="cards">
        <article className="metric-card">
          <span>Total Tasks</span>
          <b>{dashboardData.totalTasks}</b>
        </article>
        <article className="metric-card">
          <span>Total Projects</span>
          <b>{dashboardData.totalProjects}</b>
        </article>
        <article className="metric-card">
          <span>Total Users</span>
          <b>{dashboardData.totalUsers}</b>
        </article>
      </section>

      <div className="dashboard-layout">
        <section className="bar-chart dashboard-panel">
          <h2>Tasks by Status</h2>
          <ul className="status-list">
            {Object.entries(dashboardData.tasksByStatus).map(
              ([status, count]) => (
                <li key={status} className="status-item">
                  <span className="status-name">{status}</span>
                  <strong className="status-count">{count}</strong>
                </li>
              ),
            )}
          </ul>
        </section>
        <section className="dashboard-right dashboard-panel">
          <h2>Recent Tasks</h2>
          <table className="claim-detail-table">
            <thead>
              <tr>
                <th>Task Number</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentTasks.map((task) => (
                <tr key={task._id}>
                  <td data-label="Task Number">{task.taskNumber}</td>
                  <td data-label="Description">{task.description ?? "-"}</td>
                  <td data-label="Status">{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
