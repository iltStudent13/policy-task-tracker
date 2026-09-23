// Page for projects based on the api/projects and displays a list of projects. Include a form for creating new projects and handling their creation.
import { useState, useEffect, type SubmitEvent, type ChangeEvent } from "react";
import type { Project, ProjectType } from "../types";
import api from "../services/api";

const projectTypeOptions: ProjectType[] = [
  "core",
  "innovation",
  "research",
  "collaboration",
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<{
    projectNumber: string;
    name: string;
    projectType: ProjectType | "";
    status: string;
    startDate: string;
  }>({
    projectNumber: "",
    name: "",
    projectType: "",
    status: "open",
    startDate: "",
  });

  useEffect(() => {
    api
      .get("/projects")
      .then((response) => setProjects(response.data.projects ?? response.data));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.post("/projects", { ...newProject, owner: "" }).then((response) => {
      setProjects((current) => [...current, response.data]);
      setNewProject({
        projectNumber: "",
        name: "",
        projectType: "",
        status: "open",
        startDate: "",
      });
    });
  };

  return (
    <main className="projects-page">
      <header className="dashboard-header">
        <p className="dashboard-kicker">Portfolio</p>
        <h1>Projects</h1>
        <p className="dashboard-subtitle">
          Create and track the projects driving policy, research, and
          operational delivery.
        </p>
      </header>

      <section className="projects-layout">
        <aside className="dashboard-panel project-panel">
          <h2>Create Project</h2>
          <form className="project-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Project Number</span>
              <input
                type="text"
                name="projectNumber"
                value={newProject.projectNumber}
                onChange={handleChange}
                placeholder="PRJ-100"
              />
            </label>

            <label className="field">
              <span>Project Name</span>
              <input
                type="text"
                name="name"
                value={newProject.name}
                onChange={handleChange}
                placeholder="Project Name"
              />
            </label>

            <label className="field">
              <span>Project Type</span>
              <select
                name="projectType"
                value={newProject.projectType}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select Project Type
                </option>
                {projectTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select
                name="status"
                value={newProject.status}
                onChange={handleChange}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </label>

            <label className="field">
              <span>Start Date</span>
              <input
                type="date"
                name="startDate"
                value={newProject.startDate}
                onChange={handleChange}
              />
            </label>

            <button type="submit">Create Project</button>
          </form>
        </aside>

        <section className="dashboard-panel project-panel">
          <h2>Project List</h2>
          {projects.length === 0 ? (
            <p className="empty-state">No projects yet. Add your first one.</p>
          ) : (
            <ul className="project-list">
              {projects.map((project) => (
                <li key={project._id} className="project-item">
                  <div>
                    <h3>{project.name}</h3>
                    <p>
                      #{project.projectNumber} • {project.projectType}
                    </p>
                  </div>
                  <span className="status-badge">{project.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
