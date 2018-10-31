const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Load Profile model
const Profile = require('../../models/Profile')
// Load User model
const User = require('../../models/User')

// @route    GET api/profile/test
// @desc     Test profile route
// @access   Public
router.get("/test", (req, res) => res.json({ msg: "Profile works!" }))

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user.'
                return res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(err => res.status(404).json(err))
})

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
    const errors = {}

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noProfiles = 'There are no profiles.'
                res.status(404).json(errors)
            }

            res.json(profiles)
        })
        .catch(err => {
            errors.noProfiles = 'No profiles are found.'
            res.status(404).json(errors)
        })
})

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    const errors = {}

    Profile.findOne({ handle: req.params.handle })
        // Only return user's name and avatar
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'This handle does not belong to any users.'
                res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(err => { res.status(404).json(err) })
})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', (req, res) => {
    const errors = {}

    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'This profile does not have a valid user id'
                res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(err => {
            errors.noProfile = 'A valid user id is required to find this user.'
            res.status(404).json(errors)
        })
})

// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    const profileFields = {}

    profileFields.user = req.user.id

    if (req.body.handle) profileFields.handle = req.body.handle
    if (req.body.company) profileFields.company = req.body.company
    if (req.body.website) profileFields.website = req.body.website
    if (req.body.location) profileFields.location = req.body.location
    if (req.body.status) profileFields.status = req.body.status
    // Skills - split into array
    if (typeof req.body.skills !== 'undefined')
        profileFields.skills = req.body.skills.split(',')
    if (req.body.bio) profileFields.bio = req.body.bio
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername
    // Social
    profileFields.social = {}
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (profile) {
                // Update
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    // if true, return the modified document rather than the original.
                    { new: true })
                    .then(profile => { res.json(profile) })
            } else {
                // Create

                // Check if handle exists
                Profile.findOne({ handle: req.handle })
                    .then(profile => {
                        if (profile) {
                            errors.handle = 'That handle already exists.'
                            res.status(400).json(errors)
                        }
                    })
                // Save profile
                new Profile(profileFields).save().then(profile => { res.json(profile) })
            }
        })
})

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'No profile exists. You cannot add experience.'
                res.status(404).json(errors)
            }

            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add experience array
            profile.experience.unshift(newExp)
            profile.save().then(profile => res.json(profile))
        })
})

module.exports = router
