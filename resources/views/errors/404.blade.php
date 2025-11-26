@extends('errors::branded')

@section('title', __('Page Not Found'))
@section('code', '404')
@section('message', __('Oops! The page you\'re looking for doesn\'t exist.'))
@section('description', 'The page you are trying to access might have been moved, deleted, or never existed. Please check the URL or return to the homepage.')