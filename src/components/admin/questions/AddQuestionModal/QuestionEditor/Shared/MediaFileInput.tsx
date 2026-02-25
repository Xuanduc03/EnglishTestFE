import React from "react";

type Props = {
    label: string;
    required?: boolean;
    accept?: string;
    existingUrl?: string | null;
    file: File | null;
    setFile: (file: File | null) => void;
};

const MediaFileInput: React.FC<Props> = ({
    label,
    required = false,
    accept = "*",
    existingUrl,
    file,
    setFile,
}) => {
    const renderPreview = () => {
        if (!existingUrl) return null;

        if (accept.includes("audio"))
            return <audio controls src={existingUrl} style={{ width: "100%", height: 40 }} />;

        if (accept.includes("image"))
            return <img src={existingUrl} style={{ maxWidth: "100%", borderRadius: 4 }} />;

        if (accept.includes("video"))
            return <video controls src={existingUrl} style={{ width: "100%" }} />;

        return (
            <a href={existingUrl} target="_blank" rel="noreferrer">
                View file
            </a>
        );
    };

    return (
        <div className="form-group">
            <label className="form-label">
                {label} {required && <span className="required">*</span>}
            </label>

            <input
                type="file"
                accept={accept}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {/* File cũ */}
            {!file && existingUrl && (
                <div
                    className="existing-media"
                    style={{
                        marginTop: 5,
                        padding: 5,
                        background: "#f5f5f5",
                        borderRadius: 4,
                    }}
                >
                    {renderPreview()}
                    <small style={{ color: "green" }}>✓ File hiện tại đang dùng</small>
                </div>
            )}

            {/* File mới */}
            {file && (
                <span className="file-name" style={{ color: "blue" }}>
                    ➤ File mới: {file.name}
                </span>
            )}
        </div>
    );
};

export default MediaFileInput;
