import { binaryToText, email, reservet } from "../@core";

export default function SidebarWidget() {
  return (
    <div
      // className={`
      //   mx-auto mb-1 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
      className={`
        mx-auto mb-1 w-full max-w-60 rounded-2xl bg-lime-900 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      {/* <h3 className="mb-2 font-semibold text-gray-900 dark:text-white text-sm"> */}
      <h3 className="mb-2 font-semibold text-gray-300 dark:text-white text-sm">
        {binaryToText(email)}
      </h3>
      {/* <p className="mb-4 text-gray-500 dark:text-gray-400 text-sm"> */}
      <p className="mb-4 text-gray-200 dark:text-white text-sm">
        {binaryToText(reservet)}
      </p>
    </div>
  );
}
