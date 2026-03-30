import { useState, useRef, useEffect } from 'react';

/**
 * EditableValue - Click-to-edit inline input component
 * Handles number validation and keyboard interactions
 */

const styles = {
  display: {
    cursor: 'pointer',
    borderBottom: '1px dashed rgba(255,255,255,0.15)',
    transition: 'border-color var(--transition-fast)',
  },
  displayHover: {
    borderColor: 'var(--color-blue)',
  },
  input: {
    background: 'var(--bg-input)',
    border: '1px solid var(--color-blue)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 'var(--weight-semibold)',
    fontFamily: 'var(--font-mono)',
    width: 100,
    padding: '2px 6px',
    outline: 'none',
  },
};

export function EditableValue({
  value,
  onSave,
  formatter,
  parser,
  validate,
  minWidth = 100,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  // Format the display value
  const displayValue = formatter ? formatter(value) : value;

  // Start editing
  const startEdit = () => {
    setTempValue(String(value));
    setIsEditing(true);
  };

  // Confirm the edit
  const confirmEdit = () => {
    const parsed = parser ? parser(tempValue) : parseFloat(tempValue);
    const isValid = validate ? validate(parsed) : (!isNaN(parsed) && parsed > 0);

    if (isValid) {
      onSave(parsed);
    }
    setIsEditing(false);
  };

  // Cancel the edit
  const cancelEdit = () => {
    setIsEditing(false);
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      confirmEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={confirmEdit}
        onKeyDown={handleKeyDown}
        style={{
          ...styles.input,
          minWidth,
        }}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.display,
        ...(isHovered ? styles.displayHover : {}),
      }}
      title="Click to edit"
    >
      {displayValue}
    </span>
  );
}

export default EditableValue;
