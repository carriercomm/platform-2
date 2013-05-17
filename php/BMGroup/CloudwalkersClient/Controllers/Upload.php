<?php
class BMGroup_CloudwalkersClient_Controllers_Upload
	extends BMGroup_CloudwalkersClient_Controllers_Base
{
	public function dispatch (Neuron_Page $page)
	{
		$data = $this->getData ();

		header('Vary: Accept');

		if (isset($_SERVER['HTTP_ACCEPT']) &&
			(strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) 
		{
				header('Content-type: application/json');
		} 
		else 
		{
			header('Content-type: text/plain');
		}

		echo json_encode ($data);
	}

	private function getData ()
	{
		$action = $this->getInput (1);
		
		if ($action == 'delete')
		{
			// Remove a certain file.
			return $this->delete ();
		}
		else
		{
			return $this->upload ();
		}
	}

	private function delete ()
	{
		return array ('success' => true);
	}

	private function upload ()
	{
		$data = array ();

		$data['files'] = array ();

		$data['files'][] = array 
		(
			'name' => 'pciture1',
			'size' => 123,
			'url' => 'http://url.com',
			'thumbnail_url' => Neuron_URLBuilder::getURL ('upload/delete/'),
			'delete_url' => Neuron_URLBuilder::getURL ('upload/delete/'),
			'delete_type' => 'DELETE'
		);

		return $data;
	}
}