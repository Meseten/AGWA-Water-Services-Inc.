import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link',
  'color', 'background',
  'align'
];

const RichTextEditor = ({ value, onChange, placeholder, readOnly = false, theme = "snow", className = "" }) => {
  return (
    <ReactQuill
      theme={theme}
      value={value || ''}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      readOnly={readOnly}
      className={className}
    />
  );
};

export default RichTextEditor;