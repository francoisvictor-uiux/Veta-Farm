import imgWoodenSign from './wooden-sign.png';
import imgFarmBarn from './farm-barn.png';

interface StationCardProps {
  stationName: string;
  stationNumber: number;
  reservedCount: number;
  emptyCount: number;
  cattleCount: number;
  onClick: () => void;
}

export function StationCard({ stationName, reservedCount, emptyCount, cattleCount, onClick }: StationCardProps) {
  return (
    <div
      className="content-stretch flex flex-col gap-[32px] items-center w-[330.672px] cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      <div className="content-stretch flex flex-col gap-[18px] items-center w-[270.422px]">
        <div className="relative w-full" style={{ aspectRatio: '579/178' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[196.63%] left-[-15.03%] max-w-none top-[-48.31%] w-[129.53%]" src={imgWoodenSign} />
          </div>
          <p
            className="absolute left-0 right-0 text-center font-extrabold text-[#6e3706] text-[25px] px-6 leading-none"
            style={{ top: '36%', transform: 'translateY(-50%)' }}
            dir="auto"
          >
            {stationName}
          </p>
        </div>
        <div className="aspect-[586/384] relative w-full">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[215.29%] left-[-22.06%] max-w-none top-[-68.23%] w-[141.08%]" src={imgFarmBarn} />
          </div>
        </div>
      </div>

      <div className="bg-[#fafafa] content-stretch flex items-center w-full">
        <div className="content-stretch flex flex-col h-[55px] items-start pr-px pt-[8px] relative w-[109.547px]">
          <div aria-hidden="true" className="absolute border-[#f5f5f5] border-r border-solid inset-0 pointer-events-none" />
          <p className="-translate-x-1/2 font-bold leading-[24px] left-[54.81px] relative not-italic text-[#135e00] text-[16px] text-center whitespace-nowrap">{reservedCount}</p>
          <p className="-translate-x-1/2 font-medium leading-[15px] left-[54.41px] relative not-italic text-[#737373] text-[10px] text-center whitespace-nowrap" dir="auto">محجوزة</p>
        </div>
        <div className="content-stretch flex flex-col h-[55px] items-start pr-px pt-[8px] relative w-[110.563px]">
          <div aria-hidden="true" className="absolute border-[#f5f5f5] border-r border-solid inset-0 pointer-events-none" />
          <p className="-translate-x-1/2 font-bold leading-[24px] left-[54.88px] relative not-italic text-[#262626] text-[16px] text-center whitespace-nowrap">{emptyCount}</p>
          <p className="-translate-x-1/2 font-medium leading-[15px] left-[54.89px] relative not-italic text-[#737373] text-[10px] text-center whitespace-nowrap" dir="auto">قنية</p>
        </div>
        <div className="content-stretch flex flex-col h-[55px] items-start pr-px pt-[8px] w-[110.563px]">
          <p className="-translate-x-1/2 font-bold leading-[24px] left-[54.88px] relative not-italic text-[#262626] text-[16px] text-center whitespace-nowrap">{cattleCount}</p>
          <p className="-translate-x-1/2 font-medium leading-[15px] left-[54.39px] relative not-italic text-[#737373] text-[10px] text-center whitespace-nowrap" dir="auto">رؤوس</p>
        </div>
      </div>
    </div>
  );
}
