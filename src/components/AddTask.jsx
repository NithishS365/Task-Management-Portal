import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";

export const AddTask = ({ tasks, setTasks, task, setTask }) => {
  const [due, setDue] = useState(task.due || "");

  const handletask = (e) => {
    e.preventDefault();
    
    if (!task.name || task.name.trim() === "") {
      toast.error("Please enter a task name.");
      return;
    }

    if (task.id) {
      // Update existing todo
      const updatedTasks = tasks.map((todo) =>
        todo.id === task.id
          ? {
              ...todo,
              name: task.name.trim(),
              due: due || null,
              date: todo.date // Keep original creation date
            }
          : todo
      );
      setTasks(updatedTasks);
      toast.success("✅ Todo updated successfully!");
    } else {
      // Create new todo
      const newTodo = {
        id: Date.now(), // Simple ID generation for local storage
        name: task.name.trim(),
        date: new Date().toLocaleDateString(),
        due: due || null,
        completed: false
      };
      setTasks([...tasks, newTodo]);
      toast.success("✅ Todo added successfully!");
    }

    // Reset form
    setTask({});
    setDue("");
  };

  // Update due date if editing an existing todo
  React.useEffect(() => {
    setDue(task.due || "");
  }, [task]);

  return (
    <div className="w-full">
      <ToastContainer />
      <form
        onSubmit={handletask}
        className="space-y-4"
      >
        {/* Todo Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Todo Item
          </label>
          <input
            type="text"
            placeholder="What do you need to do?"
            name="input"
            value={task.name || ""}
            onChange={(e) => setTask({ ...task, name: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none shadow-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Due Date Input (Optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Due Date <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none shadow-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!task.name || task.name.trim() === ""}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <i className={`bi ${task.id ? 'bi-arrow-clockwise' : 'bi-plus-circle'}`}></i>
          <span>{task.id ? "Update Todo" : "Add Todo"}</span>
        </button>

        {/* Reset button when editing */}
        {task.id && (
          <button
            type="button"
            onClick={() => {
              setTask({});
              setDue("");
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <i className="bi bi-x-circle"></i>
            <span>Cancel Edit</span>
          </button>
        )}
      </form>
    </div>
  );
};