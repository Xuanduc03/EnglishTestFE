// hooks/useCategoryRoot.ts
import { useState, useEffect } from 'react';
import { categorieservice } from './category.service';

export const useCategoryRoot = (codeType?: string) => {
    const [rootId, setRootId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!codeType) {
            setRootId(null);
            return;
        }

        const fetchRoot = async () => {
            setLoading(true);
            try {
                const id = await categorieservice.getRootIdByCodeType(codeType);
                setRootId(id);
            } catch (error) {
                console.error("Lỗi tìm root category", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoot();
    }, [codeType]);

    return { rootId, loading };
};