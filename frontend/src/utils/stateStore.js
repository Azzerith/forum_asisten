import { useState } from "react";

export function useJadwal() {
    const [jadwal, setJadwal] = useState([]);
    return { jadwal, setJadwal };
}