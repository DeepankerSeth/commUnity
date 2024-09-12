import { v4 as uuidv4 } from 'uuid';

const requestId = (req, res, next) => {
  req.id = uuidv4();
  next();
};

export default requestId;