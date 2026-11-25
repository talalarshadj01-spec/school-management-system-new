const { Vehicle, TransportRoute, RouteStop, StudentTransport, Student } = require('../models');

const getTransport = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll();
    const routes = await TransportRoute.findAll({
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: RouteStop, as: 'stops' }
      ]
    });

    return res.status(200).json({ success: true, vehicles, routes });
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const { title, vehicleId, startPoint, endPoint, fareAmount } = req.body;
    const route = await TransportRoute.create({
      title,
      vehicleId,
      startPoint,
      endPoint,
      fareAmount
    });
    return res.status(201).json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransport, createRoute };

