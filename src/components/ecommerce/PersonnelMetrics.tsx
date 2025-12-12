import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import {
  AVC09Service,
  FilePersonnelService,
  PersonnelService,
} from "../../services";
import Badge from "../ui/badge/Badge";

export default function PersonnelMetrics() {
  const [totalPersonnel, setTotalPersonnel] = useState<number | null>(null);
  const [totalFile, setTotalFile] = useState<number | null>(null);
  const [totalAVC09, setTotalAVC09] = useState<number | null>(null);
  const [totalDelivery, setTotalDelivery] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true);
      const count = await PersonnelService.getTotalCount();
      setTotalPersonnel(count.data.count);
      const countFile = await FilePersonnelService.getTotalCount();
      setTotalFile(countFile.data.count);
      const countDelivery = await AVC09Service.getSickLeaveCount();
      setTotalDelivery(countDelivery.data.count);
      const countAVC09 = await AVC09Service.getTotalCount();
      setTotalAVC09(countAVC09.data.count);
      setLoading(false);
    };

    fetchCount();
  }, []);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Personal Policial con File
            </span>
            {loading ? (
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                cargando ...
              </h4>
            ) : (
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {totalFile}
              </h4>
            )}
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {((totalFile * 100) / totalPersonnel).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Bajas por Recoger
            </span>
            {loading ? (
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                cargando ...
              </h4>
            ) : (
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {totalDelivery}
              </h4>
            )}
          </div>

          <Badge color="error">
            <ArrowDownIcon />
            {((totalDelivery * 100) / totalAVC09).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
