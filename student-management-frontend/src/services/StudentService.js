import axios from "axios";

const API_URL = "http://localhost:8082/api/students";

const studentService = {

    // Get all students
    getAllStudents: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    // Get student by ID
    getStudentById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Create student
    createStudent: async (student) => {
        const response = await axios.post(API_URL, student);
        return response.data;
    },

    // Update student
    updateStudent: async (id, student) => {
        const response = await axios.put(
            `${API_URL}/${id}`,
            student
        );

        return response.data;
    },

    // Delete student
    deleteStudent: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};

export default studentService;