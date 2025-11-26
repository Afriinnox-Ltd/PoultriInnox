@extends('errors::branded')

@section('title', __('Unauthorized'))
@section('code', '401')
@section('message', __('Sorry, you are not authorized to access this page.'))
@section('description', 'You don\'t have permission to view this resource. Please log in with an authorized account or contact support if you believe this is an error.')