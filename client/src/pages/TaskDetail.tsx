// TaskDetail.tsx - Component for displaying the details of a specific task
import type { Task, Project, User } from "../types";
import api from "../services/api";
import { useState, useEffect } from "react";

const taskStatusOptions = ["open", "in-progress", "completed", "pending"];

export default function TaskDetail() {
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const getProjectName = (task: Task) => {
    if (typeof task.project !== "string" && task.project?.name) {
      return task.project.name;
    }

    if (project?.name) return project.name;

    const projectId =
      typeof task.project === "string" ? task.project : task.project?._id;
    return projectId ? projectId : "Unassigned";
  };

  const getUserName = (task: Task) => {
    if (typeof task.assignedTo !== "string" && task.assignedTo?.name) {
      return task.assignedTo.name;
    }

    if (assignee?.name) return assignee.name;

    const userId =
      typeof task.assignedTo === "string"
        ? task.assignedTo
        : task.assignedTo?._id;
    return userId ? userId : "Unassigned";
  };

  useEffect(() => {
    const taskId = window.location.pathname.split("/").pop();

    const fetchTaskDetails = async () => {
      try {
        const response = await api.get<Task>(`/tasks/${taskId}`);
        setTask(response.data);

        const projectId =
          typeof response.data.project === "string"
            ? response.data.project
            : response.data.project?._id;

        const assigneeId =
          typeof response.data.assignedTo === "string"
            ? response.data.assignedTo
            : response.data.assignedTo?._id;

        if (projectId) {
          const projectResponse = await api.get<Project>(
            `/projects/${projectId}`,
          );
          setProject(projectResponse.data);
        } else {
          setProject(null);
        }

        if (assigneeId) {
          const usersResponse = await api.get<User[]>("/auth/users");
          setUsers(usersResponse.data);
          const matchingAssignee = usersResponse.data.find(
            (user) => user._id === assigneeId,
          );
          setAssignee(matchingAssignee ?? null);
        } else {
          setAssignee(null);
          setUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error);
      }
    };

    fetchTaskDetails();
  }, []);

  return (
    <main className="tasks-page">
      <header className="dashboard-header">
        <p className="dashboard-kicker">Task Detail</p>
        <h1>Task Information</h1>
      </header>

      <section className="tasks-content">
        <div className="dashboard-panel task-panel task-table-panel">
          <h2>Details</h2>

          {task ? (
            <div className="task-table-container">
              <table className="task-table">
                <tbody>
                  <tr>
                    <th>Title</th>
                    <td>{task.title}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{task.description ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{task.status}</td>
                  </tr>
                  <tr>
                    <th>Project</th>
                    <td>{project ? project.name : getProjectName(task)}</td>
                  </tr>
                  <tr>
                    <th>Assignee</th>
                    <td>{assignee ? assignee.name : getUserName(task)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">Loading task details...</p>
          )}
        </div>
      </section>
    </main>
  );
}
