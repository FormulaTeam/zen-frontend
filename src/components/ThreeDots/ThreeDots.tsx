import "./ThreeDots.scss";
type Props = { text: string };

export default function ThreeDots({ text }: Props) {
  return (
    <span className="loading-text">
      {text}
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
    </span>
  );
}
