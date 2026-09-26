import { useEffect, useState } from "react";

function useLocalStorage(key, initialValue) {

    const [value, setValue] = useState(() => {

        const savedValue =
            localStorage.getItem(key);

        if (savedValue !== null) {
            return JSON.parse(savedValue);
        }

        return initialValue;
    });


    useEffect(() => {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }, [key, value]);


    return [value, setValue];
}

export default useLocalStorage;