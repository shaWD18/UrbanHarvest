import { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

const API_BASE_URL = "https://urbanharvest-production.up.railway.app/api";

export const AppProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [events, setEvents] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [weather, setWeather] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        fetchData();
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        try {
            // Colombo coordinates: 6.9271° N, 79.8612° E
            const res = await fetch(
                "https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&current_weather=true"
            );
            const data = await res.json();
            setWeather(data.current_weather);
        } catch (error) {
            console.error("Error fetching weather:", error);
            // Fallback mock data
            setWeather({
                temperature: 30,
                windspeed: 15,
                weathercode: 1
            });
        }
    };

    const fetchData = async () => {
        try {
            // Fetch products
            const productsRes = await fetch(`${API_BASE_URL}/products`);
            const productsData = await productsRes.json();
            setProducts(productsData);

            // Fetch events
            const eventsRes = await fetch(`${API_BASE_URL}/events`);
            const eventsData = await eventsRes.json();
            setEvents(eventsData);

            // Fetch workshops
            const workshopsRes = await fetch(`${API_BASE_URL}/workshops`);
            const workshopsData = await workshopsRes.json();
            setWorkshops(workshopsData);

            // Fetch subscriptions
            const subscriptionsRes = await fetch(`${API_BASE_URL}/subscriptions`);
            const subscriptionsData = await subscriptionsRes.json();
            setSubscriptions(subscriptionsData);

            setLoadingData(false);
        } catch (error) {
            console.error("Error fetching data from API:", error);
            setLoadingData(false);
        }
    };

    const value = {
        weather,
        products,
        events,
        workshops,
        subscriptions,
        loadingData,
        refreshData: fetchData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    return useContext(AppContext);
};
