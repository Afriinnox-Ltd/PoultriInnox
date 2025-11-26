@extends('errors::branded')

@section('title', __('Server Error'))
@section('code', '500')
@section('message', __('Oops! Something went wrong on our end.'))
@section('description', 'We\'re experiencing technical difficulties. Our team has been notified and is working to fix the issue. Please try again later.')