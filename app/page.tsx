import Link from "next/link";

const page = () => {
  return (
    <div>
      <Link href="/scene1">see scene1</Link>
      <br />
      <Link href="/scene2">see scene2</Link>
      <br />
      <Link href="/scene4">see scene3</Link>
      <br />
      <Link href="/scene5">see scene4</Link>
      <br />
      <Link href="/scene6">see scene5</Link>
    </div>
  );
};
export default page;
