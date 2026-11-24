import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [aToken, setATokenState] = useState(
        localStorage.getItem("aToken") || ""
    );

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dashData, setDashData] = useState(false);

    // Sync aToken with localStorage whenever it changes
    const setAToken = (token) => {
        localStorage.setItem("aToken", token);
        setATokenState(token);
    };

    // Helper function for headers
    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${aToken}` },
    });

    // Fetch all doctors
    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/admin/all-doctors`,
                getHeaders()
            );
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    // Change doctor availability
    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/change-availability`,
                { docId },
                getHeaders()
            );
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    // Fetch all appointments
    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/admin/appointments`,
                getHeaders()
            );
            if (data.success) {
                setAppointments([...data.appointments].reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    // Cancel an appointment
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/cancel-appointment`,
                { appointmentId },
                getHeaders()
            );
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    // Fetch dashboard data
    const getDashData = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/admin/dashboard`,
                getHeaders()
            );
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    // General error handler
    const handleError = (error) => {
        console.error(error);
        const errorMessage =
            error.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage);
    };

    // Context value
    const value = {
        aToken,
        setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
