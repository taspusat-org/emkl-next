import React from 'react';
import { GiCargoCrate, GiCargoShip } from 'react-icons/gi';
import {
  BsFillGearFill,
  BsFillBox2Fill,
  BsBank,
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
import { MdAccountBalance, MdOutlinePayments } from 'react-icons/md';
import { TbReportMoney } from 'react-icons/tb';
import { IoIosPricetags } from 'react-icons/io';
import { BiSolidReport } from 'react-icons/bi';
import { PiShippingContainerFill } from 'react-icons/pi';
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
  CARGO: GiCargoShip,
  CARGOCONTAINER: GiCargoCrate,
  PAYMENT: MdOutlinePayments,
  PAYMENTREPORT: TbReportMoney,
  PRICE: IoIosPricetags,
  REPORTDATA: BiSolidReport,
  CONTAINER: PiShippingContainerFill,
  BANK: BsBank
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
