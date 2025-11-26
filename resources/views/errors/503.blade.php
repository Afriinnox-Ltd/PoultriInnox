@extends('errors::branded')

@section('title', __('Service Unavailable'))
@section('code', '503')
@section('message', __('We\'ll be right back!'))
@section('description', 'The application is currently undergoing scheduled maintenance. We\'ll be back online shortly. Thank you for your patience.')