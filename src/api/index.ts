import { Router } from "express";
import cors from "cors";
import StatsService from "../services/stats";
import authenticate from "@medusajs/medusa/dist/api/middlewares/authenticate";
import subWeeks from "date-fns/subWeeks";
import addDays from "date-fns/addDays";
import { getConfigFile } from "medusa-core-utils";

export default (rootDirectory, pluginOptions) => {
  const router = Router();
  const { configModule } = getConfigFile(rootDirectory, "medusa-config") as {
    configModule: { projectConfig: { admin_cors: string } };
  };
  const { projectConfig } = configModule;

  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  router.use("/admin/stats", cors(corsOptions));

  router.options("/admin/stats");

  router.get("/admin/stats", authenticate(), async (req: any, res) => {
    const statsService: StatsService = req.scope.resolve("statsService");

    const {
      entity = ["sales", "products", "orders", "customers"],
      start,
      end,
    } = req.query as {
      entity: string[];
      start: string;
      end: string;
    };

    const stats = {};

    const defaultStartDate = subWeeks(new Date(), 1); // 7 days back
    const defaultEndDate = addDays(new Date(), 1); // tomorrow's date

    const startDate = start ? new Date(start) : defaultStartDate;
    const endDate = end ? new Date(end) : defaultEndDate;

    if (entity?.includes("sales")) {
      stats["sales"] = await statsService.fetchSalesStats({
        startDate,
        endDate,
      });
    }
    if (entity?.includes("products")) {
      stats["products"] = await statsService.fetchProductsStats({
        startDate,
        endDate,
      });
    }
    if (entity?.includes("orders")) {
      stats["orders"] = await statsService.fetchOrdersStats(
        { startDate, endDate },
        "period"
      );
    }
    if (entity.includes("customers")) {
      stats["customers"] = await statsService.fetchCustomerStats({
        startDate,
        endDate,
      });
    }

    res.json({
      stats,
    });
  });

  return router;
};
