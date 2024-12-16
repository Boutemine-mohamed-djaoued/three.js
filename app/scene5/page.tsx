import dynamic from "next/dynamic";

// Dynamically import the ThreeScene component with SSR disabled
const Content = dynamic(() => import("./Content"), { ssr: false });
const page: React.FC = () => {
  return (
    <div>
      <Content />
    </div>
  );
};

export default page;
