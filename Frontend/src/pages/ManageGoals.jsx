import { useState } from "react";
import SustainabilitySidebar from "../components/SustainabilitySidebar";
import "../styles/QuickAction.css";

function ManageGoals() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Increase Recycling",
      description: "Increase the percentage of textile waste sent for recycling.",
      target: 80,
      unit: "%",
    },
    {
      id: 2,
      title: "Reduce Textile Waste",
      description: "Reduce the total amount of textile waste generated.",
      target: 20,
      unit: "%",
    },
    {
      id: 3,
      title: "Improve Reuse",
      description: "Increase the amount of textile material reused.",
      target: 60,
      unit: "%",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target: "",
    unit: "%",
  });

  const handleAddGoal = (e) => {
    e.preventDefault();

    if (!newGoal.title || !newGoal.target) {
      alert("Please enter goal title and target.");
      return;
    }

    setGoals((previousGoals) => [
      ...previousGoals,
      {
        id: Date.now(),
        title: newGoal.title,
        description:
          newGoal.description || "Company sustainability target.",
        target: Number(newGoal.target),
        unit: newGoal.unit,
      },
    ]);

    setNewGoal({
      title: "",
      description: "",
      target: "",
      unit: "%",
    });

    setShowForm(false);
  };

  return (
    <div className="quick-action-layout">
      <SustainabilitySidebar />

      <main className="quick-action-content">
        <div className="quick-action-header goals-header">
          <div>
            <span>SUSTAINABILITY ACTION</span>
            <h1>Manage Goals</h1>
            <p>
              Review and manage sustainability targets for your company.
            </p>
          </div>

          <button
            type="button"
            className="quick-action-secondary-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Add Goal"}
          </button>
        </div>

        {showForm && (
          <form
            className="goal-form-card"
            onSubmit={handleAddGoal}
          >
            <h2>Create Sustainability Goal</h2>

            <div className="goal-form-grid">
              <div className="goal-form-field">
                <label>Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Increase Recycling"
                />
              </div>

              <div className="goal-form-field">
                <label>Target</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newGoal.target}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      target: e.target.value,
                    })
                  }
                  placeholder="80"
                />
              </div>

              <div className="goal-form-field goal-description-field">
                <label>Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the sustainability target..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="quick-action-primary-button"
            >
              Save Goal
            </button>
          </form>
        )}

        <section className="goals-grid">
          {goals.map((goal) => (
            <div className="goal-card" key={goal.id}>
              <div className="goal-card-top">
                <div className="goal-icon">◎</div>

                <span className="goal-status">
                  Active
                </span>
              </div>

              <h2>{goal.title}</h2>

              <p>{goal.description}</p>

              <div className="goal-target">
                <span>Target</span>

                <strong>
                  {goal.target}
                  {goal.unit}
                </strong>
              </div>

              <div className="goal-progress">
                <div
                  className="goal-progress-fill"
                  style={{
                    width: `${Math.min(goal.target, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default ManageGoals;