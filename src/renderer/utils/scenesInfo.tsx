import { BsFillSunsetFill, BsSunFill, BsSunriseFill } from 'react-icons/bs'
import {
  FaBed,
  FaCanadianMapleLeaf,
  FaCandyCane,
  FaCouch,
  FaGlasses,
  FaHeart,
  FaMartiniGlass,
  FaMoon,
  FaMugHot,
  FaPalette,
  FaSnowflake,
  FaTv
} from 'react-icons/fa6'
import { GiCandleHolder, GiHighGrass, GiPalmTree, GiSteampunkGoggles } from 'react-icons/gi'
import { HiColorSwatch } from 'react-icons/hi'
import { IoMdMicrophone } from 'react-icons/io'
import { IoFish } from 'react-icons/io5'
import { LuPartyPopper } from 'react-icons/lu'
import { MdForest, MdSunny, MdWaves } from 'react-icons/md'
import { PiFlowerLotusBold, PiTreeFill } from 'react-icons/pi'
import { RiGhostFill, RiPlantFill, RiPulseFill } from 'react-icons/ri'
import { TbCampfireFilled } from 'react-icons/tb'

type Scene = {
  id: number
  name: string
  icon: React.ReactNode
  type: 'static' | 'dynamic' | 'custom'
}

const ICON_SIZE = 24

export const scenes: Scene[] = [
  {
    id: 11,
    name: 'warmWhite',
    icon: <FaMugHot size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 12,
    name: 'dayLight',
    icon: <BsSunFill size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 13,
    name: 'coldWhite',
    icon: <FaSnowflake size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 14,
    name: 'nightLight',
    icon: <FaMoon size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 6,
    name: 'cozy',
    icon: <FaCouch size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 17,
    name: 'trueColors',
    icon: <FaPalette size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 16,
    name: 'relax',
    icon: <PiFlowerLotusBold size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 15,
    name: 'focus',
    icon: <FaGlasses size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 18,
    name: 'tvTime',
    icon: <FaTv size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 19,
    name: 'plantGrowth',
    icon: <RiPlantFill size={ICON_SIZE} />,
    type: 'static'
  },
  {
    id: 29,
    name: 'candleLight',
    icon: <GiCandleHolder size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 31,
    name: 'pulse',
    icon: <RiPulseFill size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 30,
    name: 'goldenWhite',
    icon: <MdSunny size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 32,
    name: 'steampunk',
    icon: <GiSteampunkGoggles size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 5,
    name: 'fireplace',
    icon: <TbCampfireFilled size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 22,
    name: 'fall',
    icon: <FaCanadianMapleLeaf size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 26,
    name: 'club',
    icon: <IoMdMicrophone size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 3,
    name: 'sunset',
    icon: <BsFillSunsetFill size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 2,
    name: 'romance',
    icon: <FaHeart size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 4,
    name: 'party',
    icon: <LuPartyPopper size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 8,
    name: 'pastelColors',
    icon: <HiColorSwatch size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 20,
    name: 'spring',
    icon: <PiTreeFill size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 21,
    name: 'summer',
    icon: <GiPalmTree size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 7,
    name: 'forest',
    icon: <MdForest size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 24,
    name: 'jungle',
    icon: <GiHighGrass size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 25,
    name: 'mojito',
    icon: <FaMartiniGlass size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 1,
    name: 'ocean',
    icon: <MdWaves size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 23,
    name: 'deepDive',
    icon: <IoFish size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 27,
    name: 'christmas',
    icon: <FaCandyCane size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 28,
    name: 'halloween',
    icon: <RiGhostFill size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 10,
    name: 'bedtime',
    icon: <FaBed size={ICON_SIZE} />,
    type: 'dynamic'
  },
  {
    id: 9,
    name: 'wakeUp',
    icon: <BsSunriseFill size={ICON_SIZE} />,
    type: 'dynamic'
  }
]
