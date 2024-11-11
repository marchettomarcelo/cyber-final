import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Modal, TextField, Box, Paper, IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axiosInstance from '../services/apiService';
import { useNavigate } from 'react-router-dom';


const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await axiosInstance.get('/user-info', {
      headers: { 'X-Session-Token': token }
    });
    return response.data.user_id;
  } catch (error) {
    return null;
  }
};

function Dashboard() {
  const [tasks, setTasks] = useState({ TODO: [], DOING: [], DONE: [] });
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const fetchTasks = async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axiosInstance.get(`/users/${userId}/tasks`, {
        headers: { 'X-Session-Token': token }
      });
      const groupedTasks = { TODO: [], DOING: [], DONE: [] };
      response.data.forEach(task => {
        groupedTasks[task.status].push(task);
      });
      setTasks(groupedTasks);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch tasks', 'error');
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const id = await getUserInfo();
      if (id) {
        setUserId(id);
        fetchTasks(id);
      } else {
        Swal.fire('Session Expired', 'Please log in again.', 'warning').then(() => {
          navigate('/');
        });
      }
    };
    initializeDashboard();
  }, [navigate]);

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
  
    if (!destination || source.droppableId === destination.droppableId) return;
  
    const sourceTasks = Array.from(tasks[source.droppableId] || []);
    const destinationTasks = Array.from(tasks[destination.droppableId] || []);
  
    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.status = destination.droppableId;
  
    destinationTasks.splice(destination.index, 0, movedTask);
  
    setTasks({
      ...tasks,
      [source.droppableId]: sourceTasks,
      [destination.droppableId]: destinationTasks,
    });
  
    try {
      const token = localStorage.getItem('jwtToken');
      await axiosInstance.put(`/tasks/${movedTask.id}`, { status: destination.droppableId }, {
        headers: { 'X-Session-Token': token },
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to update task status', 'error');
    }
  };
  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Função para criar nova tarefa
  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      Swal.fire('Error', 'Title and description cannot be empty', 'error');
      return;
    }

    const token = localStorage.getItem('jwtToken');
    try {
      await axiosInstance.post(`/users/${userId}/tasks`, {
        title: newTask.title,
        description: newTask.description,
        status: 'TODO'
      }, {
        headers: { 'X-Session-Token': token }
      });
      fetchTasks(userId);
      setNewTask({ title: '', description: '' });
      handleClose();
      Swal.fire('Success', 'Task created successfully!', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to create task', 'error');
    }
  };

  // Função para deletar uma tarefa
  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axiosInstance.delete(`/tasks/${taskId}`, {
        headers: { 'X-Session-Token': token }
      });
      Swal.fire('Deleted!', 'Task has been deleted.', 'success');
      fetchTasks(userId);
    } catch (error) {
      Swal.fire('Error', 'Failed to delete task', 'error');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" gutterBottom>
        Dashboard
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Task
      </Button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display="flex" justifyContent="space-between" mt={4}>
          {['TODO', 'DOING', 'DONE'].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  width="30%"
                  minHeight="300px"
                  component={Paper}
                  elevation={3}
                  p={2}
                >
                  <Typography variant="h5" align="center">{status}</Typography>
                  {tasks[status].map((task, index) => (
                    <Draggable key={task.id} draggableId={`${task.id}`} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          mb={2}
                          p={2}
                          bgcolor="grey.100"
                          borderRadius="4px"
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box width="80%"> {/* Limitar a largura para evitar sobreposição com o ícone */}
                            <Typography
                              variant="subtitle1"
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'normal',  // Permitir quebra de linha
                                display: '-webkit-box',
                                WebkitLineClamp: 1, // Exibe no máximo 1 linha para o título
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              style={{
                                overflow: 'hidden',
                                whiteSpace: 'normal',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {task.description}
                            </Typography>
                          </Box>
                          {status === 'DONE' && (
                            <IconButton
                              aria-label="delete"
                              color="secondary"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>


                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      {/* Modal para criar nova tarefa */}
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }}
          width={400} bgcolor="background.paper" p={4} borderRadius={4}
        >
          <Typography variant="h6" gutterBottom>Create New Task</Typography>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleCreateTask}>
            Create Task
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}

export default Dashboard;
