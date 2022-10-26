import { addDays, subWeeks } from "date-fns";
import { Router } from "express";
import { getConfigFile } from "medusa-core-utils";
import StatsService from "./../services/stats";
import { PeriodType } from "../utils";

export default (rootDirectory) => {
  const router = Router();
  const { configModule } = getConfigFile(rootDirectory, "medusa-config") as {
    configModule: { projectConfig: { admin_cors: string } };
  };
  const { projectConfig } = configModule;
  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  // TODO: fix this in development
  // router.use("/admin/stats", cors(corsOptions));

  router.options("/admin/stats");

  router.get("/admin/stats", async (req: any, res) => {
    const statsService: StatsService = req.scope.resolve("statsService");

    const {
      entity = ["sales", "products", "orders", "customers"],
      start,
      end,
      period = "day",
    } = req.query as {
      entity: string[];
      start: string;
      end: string;
      period: PeriodType;
    };

    const stats = {};

    const defaultStartDate = subWeeks(new Date(), 1); // 7 days back
    const defaultEndDate = addDays(new Date(), 1); // tomorrow's date

    const startDate = start ? new Date(start) : defaultStartDate;
    const endDate = end ? new Date(end) : defaultEndDate;

    if (entity?.includes("sales")) {
      stats["sales"] = await statsService.fetchSalesStats(
        {
          startDate,
          endDate,
        },
        period
      );
    }
    if (entity?.includes("products")) {
      stats["products"] = await statsService.fetchProductsStats(
        {
          startDate,
          endDate,
        },
        period
      );
    }
    if (entity?.includes("orders")) {
      stats["orders"] = await statsService.fetchOrdersStats(
        { startDate, endDate },
        period
      );
    }
    if (entity.includes("customers")) {
      stats["customers"] = await statsService.fetchCustomerStats(
        {
          startDate,
          endDate,
        },
        period
      );
    }

    res.json({
      stats,
    });
  });

  return router;
};
