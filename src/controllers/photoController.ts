import { Request, Response, NextFunction } from "express";
import {
  getPhotos as getPhotosService,
  getPhoto as getPhotoService,
} from "../services/photoService";
import { PhotosFilter } from "../types/photos";

// Get paginated photos based on filters sent by the user
export const getPhotos = async (
  req: Request<any, any, any, PhotosFilter>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getPhotosService(req.query);
    res.status(200).json(data);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

// Get photos based on id sent by the user
export const getPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getPhotoService(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};
