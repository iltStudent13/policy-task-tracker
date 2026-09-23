// Page that lists all tasks based on the api/tasks and displays a list of tasks. Include a form for creating new tasks and handling their creation. Use .css styling consistent with the rest of the application. Option to update existing task fields using the api.
import { useState, useEffect, type SubmitEvent, type ChangeEvent } from "react";
import type { Task, Project, User } from "../types";
import api from "../services/api";

const taskStatusOptions = ["open", "in-progress", "completed", "pending"];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    status: string;
    project?: string;
    assignedTo?: string;
  }>({
    title: "",
    description: "",
    status: "open",
    project: "",
    assignedTo: "",
  });

  useEffect(() => {
    api
      .get("/tasks")
      .then((response) => setTasks(response.data.tasks ?? response.data));
    api
      .get("/projects")
      .then((response) => setProjects(response.data.projects ?? response.data));
    api
      .get("/auth/users")
      .then((response) => setUsers(response.data.users ?? response.data));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...newTask,
      project: newTask.project || undefined,
      assignedTo: newTask.assignedTo || undefined,
    };

    if (editingTaskId) {
      api.put(`/tasks/${editingTaskId}`, payload).then((response) => {
        setTasks((current) =>
          current.map((task) =>
            task._id === editingTaskId ? response.data : task,
          ),
        );
        setEditingTaskId(null);
        setNewTask({
          title: "",
          description: "",
          status: "open",
          project: "",
          assignedTo: "",
        });
      });
      return;
    }

    api.post("/tasks", payload).then((response) => {
      setTasks((current) => [...current, response.data]);
      setNewTask({
        title: "",
        description: "",
        status: "open",
        project: "",
        assignedTo: "",
      });
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task._id);
    setNewTask({
      title: task.title ?? "",
      description: task.description ?? "",
      status: task.status,
      project:
        typeof task.project === "string"
          ? task.project
          : (task.project?._id ?? ""),
      assignedTo:
        typeof task.assignedTo === "string"
          ? task.assignedTo
          : (task.assignedTo?._id ?? ""),
    });
  };

  const handleDelete = (taskId: string) => {
    api.delete(`/tasks/${taskId}`).then(() => {
      setTasks((current) => current.filter((task) => task._id !== taskId));
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setNewTask({
          title: "",
          description: "",
          status: "open",
          project: "",
          assignedTo: "",
        });
      }
    });
  };

  const getProjectName = (task: Task) => {
    const projectId =
      typeof task.project === "string" ? task.project : task.project?._id;

    if (!projectId) return "Unassigned";

    const matchedProject = projects.find(
      (project) => project._id === projectId,
    );
    if (matchedProject) return matchedProject.name;

    if (typeof task.project !== "string")
      return task.project?.name ?? "Unassigned";
    return projectId;
  };

  const getUserName = (task: Task) => {
    const userId =
      typeof task.assignedTo === "string"
        ? task.assignedTo
        : task.assignedTo?._id;

    if (!userId) return "Unassigned";

    const matchedUser = users.find((user) => user._id === userId);
    if (matchedUser) return matchedUser.name;

    if (typeof task.assignedTo !== "string")
      return task.assignedTo?.name ?? "Unassigned";
    return userId;
  };

  const getTaskTitle = (task: Task) => {
    return (
      (task as Task & { title?: string }).title ?? task.taskNumber ?? "Task"
    );
  };

  return (
    <main className="tasks-page">
      <header className="dashboard-header">
        <h1>Tasks</h1>
      </header>

      <section className="tasks-content">
        <div className="dashboard-panel task-panel task-form-panel">
          <h2>{editingTaskId ? "Edit Task" : "Create Task"}</h2>
          <form className="task-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleChange}
                placeholder="Task Title"
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                name="description"
                value={newTask.description}
                onChange={handleChange}
                placeholder="Brief task summary"
              />
            </label>

            <label className="field">
              <span>Status</span>
              <select
                name="status"
                value={newTask.status}
                onChange={handleChange}
              >
                {taskStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Project</span>
              <select
                name="project"
                value={newTask.project ?? ""}
                onChange={handleChange}
              >
                <option value="">Select a project</option>
                {projects.map((project: Project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Assign To</span>
              <select
                name="assignedTo"
                value={newTask.assignedTo ?? ""}
                onChange={handleChange}
              >
                <option value="">Select a user</option>
                {users.map((user: User) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit">
              {editingTaskId ? "Save Task" : "Create Task"}
            </button>
            {editingTaskId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingTaskId(null);
                  setNewTask({
                    title: "",
                    description: "",
                    status: "open",
                    project: "",
                    assignedTo: "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="dashboard-panel task-panel task-table-panel">
          <h2>Task List</h2>
          {tasks.length === 0 ? (
            <p className="empty-state">No tasks available.</p>
          ) : (
            <div className="task-table-container">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task #</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.taskNumber ?? "-"}</td>
                      <td>{getTaskTitle(task)}</td>
                      <td>{task.description ?? "-"}</td>
                      <td>
                        <span className="status-badge">{task.status}</span>
                      </td>
                      <td>{getProjectName(task)}</td>
                      <td>{getUserName(task)}</td>
                      <td className="task-actions-cell">
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="small-button danger-button"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
