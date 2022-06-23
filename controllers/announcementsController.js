const { Announcement } = require('../models/announcementModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');

const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/assets/images');
	},
	filename: (req, file, cb) => {
		const ext = file.mimetype.split('/')[1];
		cb(null, `annoucement-${Date.now()}.${ext}`);
	}
});

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new Error('Not an image! please upload only images.'), false);
	}
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

exports.uploadImage = upload.single('image');

exports.createAnnouncement = catchAsync(async (req, res, next) => {
	if (req.file) {
		req.body.image = req.file.filename;
	}

	const accouncement = await Announcement.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {
			accouncement
		}
	});
});

exports.getAllAnnouncements = catchAsync(async (req, res, next) => {
	// Build Query
	const features = new APIFeatures(Announcement.find(), req.query).filter().sort().limitFields().paginate();

	// Execute Query
	const announcements = await features.query;

	// Add base url to each image if exists;
	for (let rec of announcements) {
		if (rec.image) {
			rec.image = `${req.get('host')}/assets/images/${rec.image}`;
		}
	}

	res.status(200).json({
		status: 'success',
		records: await Announcement.count(),
		data: {
			announcements
		}
	});
});

exports.getAnnouncement = catchAsync(async (req, res, next) => {
	const announcement = await Announcement.findById(req.params.id);
	
	res.status(200).json({
		status: 'success',
		data: {
			announcement
		}
	});
});