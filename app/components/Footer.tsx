import Image from "next/image";

const Footer = () => (
  <div className="flex flex-col items-center justify-between bg-[#343434] px-4 py-4 md:flex-row">
    <div className="mb-2 flex-grow pl-0 text-center md:mb-0 md:pl-0 lg:pl-48">
      <span className="text-sm text-[#6F6F6F]">
        Powered by{" "}
        <a href="https://dub.sh/together-ai" className="underline">
          Together.ai
        </a>{" "}
        &{" "}
        <a href="https://dub.sh/flux-playground" className="underline">
          Flux
        </a>
      </span>
    </div>
  </div>
);

export default Footer;
