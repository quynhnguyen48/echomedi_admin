const DataItemDescription = ({ title, content, className }) => {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <p className="mt-4 break-words">{content}</p>
    </div>
  );
};

export default DataItemDescription;
