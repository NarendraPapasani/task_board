import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit2, LogOut, Calendar } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // For editing

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTasks();
    }
  }, [token, navigate]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast.success("Logged out successfully", {
      style: { background: "green", color: "white", border: "none" },
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setStatus("TODO");
    setCurrentTask(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (task) => {
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setStatus(task.status);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (currentTask) {
        // Update
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/tasks/${currentTask.id}`,
          { title, description, priority, status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(
          tasks.map((t) => (t.id === currentTask.id ? response.data : t))
        );
        toast.success("Task updated", {
          style: { background: "green", color: "white", border: "none" },
        });
      } else {
        // Create
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/tasks`,
          { title, description, priority },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks([response.data, ...tasks]);
        toast.success("Task created", {
          style: { background: "green", color: "white", border: "none" },
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed", {
        description: error.response?.data?.message || "Something went wrong",
        style: { background: "red", color: "white", border: "none" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success("Task deleted", {
        style: { background: "green", color: "white", border: "none" },
      });
    } catch (error) {
      console.error(error);
      toast.error("Delete failed", {
        style: { background: "red", color: "white", border: "none" },
      });
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    // Optimistic update
    const originalTasks = [...tasks];
    setTasks(
      tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/tasks/${task.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(
        newStatus === "DONE" ? "Task completed!" : "Task reopened",
        {
          style: { background: "green", color: "white", border: "none" },
        }
      );
    } catch (error) {
      // Revert on error
      setTasks(originalTasks);
      toast.error("Update failed", {
        style: { background: "red", color: "white", border: "none" },
      });
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              ProU Technology TaskBoard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={openAddDialog}
              size="sm"
              className="hidden sm:flex"
            >
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openAddDialog}
              className="sm:hidden"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />{" "}
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-gray-500">Loading your tasks...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {tasks.length}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    Total Tasks
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {tasks.filter((t) => t.status === "TODO").length}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    To Do
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-yellow-600">
                    {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    In Progress
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">
                    {tasks.filter((t) => t.status === "DONE").length}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    Completed
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className={`group hover:shadow-lg transition-all duration-200 border-l-4 ${
                    task.status === "DONE"
                      ? "border-l-green-500 opacity-75"
                      : "border-l-blue-500"
                  }`}
                >
                  <CardHeader className="pb-3 space-y-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.status === "DONE"}
                          onCheckedChange={() => handleToggleStatus(task)}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <CardTitle
                            className={`text-lg font-semibold leading-none ${
                              task.status === "DONE"
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p
                      className={`text-sm line-clamp-2 min-h-[2.5rem] ${
                        task.status === "DONE"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {task.description || "No description provided."}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between items-center border-t bg-gray-50/50 px-6 py-3">
                    <span
                      className={`text-xs font-medium ${
                        task.status === "DONE"
                          ? "text-green-600"
                          : task.status === "IN_PROGRESS"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-blue-600"
                        onClick={() => openEditDialog(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-600"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No tasks
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new task.
            </p>
            <div className="mt-6">
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {currentTask ? "Edit Task" : "Create New Task"}
              </DialogTitle>
              <DialogDescription>
                {currentTask
                  ? "Update the details of your task below."
                  : "Add a new task to your list to stay organized."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Task Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Review project documentation"
                  required
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about this task..."
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority Level
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">
                        <span className="flex items-center text-green-600">
                          Low Priority
                        </span>
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        <span className="flex items-center text-yellow-600">
                          Medium Priority
                        </span>
                      </SelectItem>
                      <SelectItem value="HIGH">
                        <span className="flex items-center text-red-600">
                          High Priority
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {currentTask && (
                  <div className="grid gap-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Current Status
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentTask ? "Save Changes" : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;
