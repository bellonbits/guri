import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
    return useContext(CompareContext);
};

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('guri_compare_list');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse compare list', e);
            }
        }
    }, []);

    // Save to local storage whenever list changes
    useEffect(() => {
        localStorage.setItem('guri_compare_list', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (property) => {
        if (compareList.find(p => p.id === property.id)) {
            alert('Property already in compare list');
            return;
        }

        if (compareList.length >= 3) {
            alert('You can compare up to 3 properties');
            return;
        }

        setCompareList([...compareList, property]);
        setIsOpen(true);
    };

    const removeFromCompare = (propertyId) => {
        setCompareList(compareList.filter(p => p.id !== propertyId));
    };

    const clearCompare = () => {
        setCompareList([]);
        setIsOpen(false);
    };

    const toggleCompare = (property) => {
        if (compareList.find(p => p.id === property.id)) {
            removeFromCompare(property.id);
        } else {
            addToCompare(property);
        }
    };

    const isInCompare = (propertyId) => {
        return compareList.some(p => p.id === propertyId);
    };

    return (
        <CompareContext.Provider value={{
            compareList,
            isOpen,
            setIsOpen,
            addToCompare,
            removeFromCompare,
            clearCompare,
            toggleCompare,
            isInCompare
        }}>
            {children}
        </CompareContext.Provider>
    );
};
