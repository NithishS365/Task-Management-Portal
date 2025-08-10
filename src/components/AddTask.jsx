import React, { useState } from "react";

export const AddTask = ({ tasks, setTasks, task, setTask }) => {
  const [due, setDue] = useState(task.due || "");

  const handletask = (e) => {
    e.preventDefault();
    const date = new Date();

    if (!task.name || !due) {
      alert("Please enter a task and select a due date.");
      return;
    }

    if (task.id) {
      const updatedtasks = tasks.map((todo) =>
        todo.id === task.id
          ? {
              id: date.getTime(),
              name: task.name,
              date: `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
              due,
            }
          : todo
      );
      setTasks(updatedtasks);
    } else {
      const newTask = {
        id: date.getTime(),
        name: task.name,
        date: `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
        due,
      };
      setTasks([...tasks, newTask]);
    }

    setTask({});
    setDue("");
  };

  // Update due date if editing an existing task
  React.useEffect(() => {
    setDue(task.due || "");
  }, [task]);

  return (
    <section className="flex font-Montserrat justify-center items-center mt-8">
      <form
        onSubmit={handletask}
        className="bg-white min-w-[400px] max-w-2xl w-full flex flex-col md:flex-row md:justify-evenly items-center gap-4 px-6 py-6 shadow-lg rounded-3xl border border-gray-200"
        style={{ transition: "box-shadow 0.3s" }}
      >
        <input
          type="text"
          placeholder="Add a Task"
          name="input"
          value={task.name || ""}
          onChange={(e) => setTask({ ...task, name: e.target.value })}
          className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:outline-none shadow-sm transition"
        />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:outline-none shadow-sm transition"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow hover:from-green-700 hover:to-green-600 transition"
        >
          {task.id ? "Update" : "Add"}
        </button>
      </form>
    </section>
  );
};
