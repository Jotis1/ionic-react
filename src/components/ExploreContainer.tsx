import './ExploreContainer.css';

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div className="container">
      <strong>{name}</strong>
      <p>Esto es un <a target="_blank" rel="noopener noreferrer" href="#">hola mundo</a></p>
    </div>
  );
};

export default ExploreContainer;
