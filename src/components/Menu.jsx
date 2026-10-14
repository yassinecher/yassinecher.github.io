import { SECTIONS } from "../config";
import { profile } from "../data/profile";

export const Menu = (props) => {
  const { onSectionChange, navigate, menuOpened, setMenuOpened } = props;

  return (
    <>
      <button
        onClick={() => setMenuOpened(!menuOpened)}
        aria-label={menuOpened ? "Close menu" : "Open menu"}
        className="z-20 fixed top-4 right-4 md:top-12 md:right-12 p-3 bg-amber-500 w-11 h-11 rounded-md"
      >
        <div
          className={`bg-black h-0.5 rounded-md w-full transition-all ${
            menuOpened ? "rotate-45  translate-y-0.5" : ""
          }`}
        />
        <div
          className={`bg-black h-0.5 rounded-md w-full my-1 ${
            menuOpened ? "hidden" : ""
          }`}
        />
        <div
          className={`bg-black h-0.5 rounded-md w-full transition-all ${
            menuOpened ? "-rotate-45" : ""
          }`}
        />
      </button>
      <div
        className={`z-10 fixed top-0 right-0 bottom-0 bg-[#0d0d0f] border-l border-white/10 transition-all overflow-hidden flex flex-col
      ${menuOpened ? "w-full md:w-80" : "w-0"}`}
      >
        <div className="flex-1 flex items-start justify-center flex-col gap-5 p-8 font-sans">
          {SECTIONS.map((label, index) => (
            <MenuButton key={label} label={label} onClick={() => onSectionChange(index)} />
          ))}
          <div className="h-px w-full bg-white/10 my-2" />
          <MenuButton label="All projects →" onClick={() => navigate("/projects")} />
          <div className="flex gap-4 text-sm font-semibold text-gray-400">
            <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-amber-400">
              GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-amber-400">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const MenuButton = (props) => {
  const { label, onClick } = props;
  return (
    <button
      onClick={onClick}
      className="font-display text-2xl font-bold text-white cursor-pointer hover:text-amber-400 transition-colors whitespace-nowrap"
    >
      {label}
    </button>
  );
};
