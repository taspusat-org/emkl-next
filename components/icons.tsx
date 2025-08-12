import React from 'react';
import { GiCargoShip } from 'react-icons/gi';
import {
  BsFillGearFill,
  BsFillBox2Fill,
  BsCheck,
  BsChevronRight,
  BsChevronLeft,
  BsDatabaseFillGear,
  BsPersonFillGear,
  BsPersonFillSlash,
  BsFillKanbanFill,
  BsBoxFill,
  BsXCircleFill,
  BsPersonVcardFill,
  BsFillCalendarCheckFill,
  BsFillChatDotsFill,
  BsFillExclamationCircleFill,
  BsFillHeartFill,
  BsFillLightningChargeFill,
  BsFillPlayFill,
  BsFillPauseFill,
  BsFillStopFill,
  BsFillStarFill,
  BsMenuButtonWideFill,
  BsFillEyeFill,
  BsPersonFillLock,
  BsFillEyeSlashFill,
  BsCurrencyDollar
} from 'react-icons/bs';
import { RiLogoutBoxRFill } from 'react-icons/ri';
import {
  FaUserEdit,
  FaUserCheck,
  FaPencilAlt,
  FaPrint,
  FaVoicemail,
  FaShip
} from 'react-icons/fa';
import { FaBuildingUser } from 'react-icons/fa6';
import { MdAccountBalance } from 'react-icons/md';
export type IconComponent = React.ComponentType<{
  className?: string;
  size?: string;
}>;

const iconMap: Record<string, IconComponent> = {
  SETTINGS: BsFillGearFill,
  BOX: BsFillBox2Fill,
  CHECK: BsCheck,
  CHEVRONRIGHT: BsChevronRight,
  CHEVRONLEFT: BsChevronLeft,
  DATABASESETTINGS: BsDatabaseFillGear,
  PERSONSETTINGS: BsPersonFillGear,
  PERSONSLASH: BsPersonFillSlash,
  KANBAN: BsFillKanbanFill,
  BOXFILL: BsBoxFill,
  CLOSECIRCLE: BsXCircleFill,
  PERSONVCARD: BsPersonVcardFill,
  PERSONLOCK: BsPersonFillLock,
  CALENDARCHECK: BsFillCalendarCheckFill,
  CHAT: BsFillChatDotsFill,
  EXCLAMATIONCIRCLE: BsFillExclamationCircleFill,
  HEART: BsFillHeartFill,
  LIGHTNING: BsFillLightningChargeFill,
  PLAY: BsFillPlayFill,
  PAUSE: BsFillPauseFill,
  STOP: BsFillStopFill,
  STAR: BsFillStarFill,
  EYE: BsFillEyeFill,
  MENU: BsMenuButtonWideFill,
  EYESLASH: BsFillEyeSlashFill,
  USEREDIT: FaUserEdit,
  USERAPPROVAL: FaUserCheck,
  LOGOUT: RiLogoutBoxRFill,
  REPORT: FaPrint,
  NOTE: FaPencilAlt,
  CABANG: FaBuildingUser,
  EMAIL: FaVoicemail,
  MONEY: BsCurrencyDollar,
  SHIP: FaShip,
  ACCOUNTING: MdAccountBalance,
  CARGO: GiCargoShip
};

type IconsProps = {
  name: string;
  className?: string;
  size?: string;
};

export const Icons: React.FC<IconsProps> = ({ name, className, size }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Icon with name "${name}" does not exist.`);
    return null;
  }
  return <IconComponent size={size} className={className} />;
};
