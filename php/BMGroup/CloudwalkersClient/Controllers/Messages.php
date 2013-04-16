<?php
class BMGroup_CloudwalkersClient_Controllers_Home
	extends BMGroup_CloudwalkersClient_Controllers_Base
{
	public function getContent ()
	{
		$client = BMGroup_CloudwalkersClient_Client::getInstance ();
		if (!$client->isLogin ())
		{
			return '<p>Please login.</p>';
		}

		$streamid = Neuron_Core_Tools::getInput ('_GET', 'stream', 'int');
		if (!$streamid)
		{
			return '<p>No stream selected.</p>';
		}

		$stream = $client->get ('stream/' . $streamid);
		$stream = $stream['stream'];

		$page = new Neuron_Core_Template ();

		$page->set ('messages', $stream['messages']);

		return $page->parse ('modules/cloudwalkersclient/pages/messages/messages.phpt');
	}
}