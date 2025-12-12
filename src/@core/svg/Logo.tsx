// import LogoIcon from "../../icons/Logo.svg";

import { LogoIcon } from "../../icons";

interface LogoProps {
  logoSize?: string | number;
}

export function Logo({ logoSize }: LogoProps) {
  // return <img src={LogoIcon} alt="Logo" className="w-8 h-8" />;
  return (
    <LogoIcon
      width={typeof logoSize === "number" ? `${logoSize}px` : logoSize}
      height={typeof logoSize === "number" ? `${logoSize}px` : logoSize}
    />
  );
}

export default Logo;
