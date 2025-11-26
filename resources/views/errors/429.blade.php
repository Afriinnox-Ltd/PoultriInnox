@extends('errors::branded')

@section('title', __('Too Many Requests'))
@section('code', '429')
@section('message', __('Whoa there! You\'re going too fast.'))
@section('description', 'You have made too many requests in a short period. Please wait a moment and try again.')