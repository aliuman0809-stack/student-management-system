import axios from "axios";

const API_URL = "https://student-management-system-q764.onrender.com/api/students";

const studentService = {
    getAllStudents: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    getStudentById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },
    createStudent: async (student) => {
        const response = await axios.post(API_URL, student);
        return response.data;
    },
    updateStudent: async (id, student) => {
        const response = await axios.put(`${API_URL}/${id}`, student);
        return response.data;
    },
    deleteStudent: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};

export default studentService;